import { Injectable, Logger } from '@nestjs/common';
import denominate from './formatters';
import { NumbatProxyService } from '../../common/services/numbat-communication/numbat-proxy.service';
import { numbatConfig } from '../../config';
import { CacheManagerService } from '../../common/services/cache-manager/cache-manager.service';
import { DharitrIApiNetworkStake } from '../../common/services/numbat-communication/models/network-stake.dto';
import { NetworkStakeLoaderService } from '../../common/services/numbat-communication/loaders';
import { NumbatApiService } from '../../common/services/numbat-communication/numbat-api.service';

const denominateValue = (value: string) => {
  const denominatedValueString = denominate({
    input: value,
    denomination: numbatConfig.denomination,
    decimals: numbatConfig.decimals,
    showLastNonZeroDecimal: true,
  });
  return denominatedValueString.replace(/,/g, '');
};

@Injectable()
export class DelegationAprService {
  private readonly logger = new Logger(DelegationAprService.name);

  constructor(
    private numbatProxyService: NumbatProxyService,
    private cacheManager: CacheManagerService,
    private readonly networkStakeLoaderService: NetworkStakeLoaderService,
    private readonly numbatApiService: NumbatApiService,
  ) {
  }

  async getProviderAPR(
    delegationContract: string,
    serviceFee: number
  ): Promise<number> {

    const cachedAPR = await this.cacheManager.getProviderAPR(delegationContract, serviceFee);
    if (!!cachedAPR) {
      return cachedAPR;
    }

    const stakingV5Settings = await this.getStakingV5Settings();

    const [
      activeStakeResponse,
      blsKeysResponse,
      networkStats,
      networkStake,
      networkConfig,
      stakedBalance,
      unqualifiedNodes,
    ] = await Promise.all(
      [
        this.numbatProxyService.getGlobalDelegationMethod('getTotalActiveStake', delegationContract),
        this.numbatProxyService.getBlsKeys(delegationContract),
        this.numbatProxyService.getNetworkStatus(),
        this.networkStakeLoaderService.load(),
        this.numbatProxyService.getNetworkConfig(),
        this.numbatProxyService.getAccountBalance(numbatConfig.auctionContract),
        this.numbatApiService.getValidatorUnqualifiedNodes(delegationContract),
      ]
    );
    this.logger.log(`getProviderAPR: ${delegationContract} ${serviceFee}`, {
      networkStats,
      networkStake,
      networkConfig,
      stakedBalance: stakedBalance.toFixed(),
      unqualifiedNodes,
    });

    const blsKeys: Buffer[] = blsKeysResponse.getReturnDataParts();
    const activeStake: Buffer = activeStakeResponse.getReturnDataParts()[0];
    const feesInEpoch = numbatConfig.feesInEpoch;
    const stakePerNode = numbatConfig.stakePerNode;
    let protocolSustainabilityRewards = numbatConfig.protocolSustainabilityRewards;
    let genesisTokenSupply = numbatConfig.genesisTokenSupply;
    let epochsSinceGenesis = networkStats.EpochNumber;
    let yearSettings = numbatConfig.yearSettings;
    if (stakingV5Settings.enabled) {
      protocolSustainabilityRewards = numbatConfig.stakingV5ProtocolSustainabilityRewards;
      genesisTokenSupply = numbatConfig.stakingV5GenesisTokenSupply;
      epochsSinceGenesis = networkStats.EpochNumber - stakingV5Settings.activationEpoch;
      if (epochsSinceGenesis < 0) {
        epochsSinceGenesis = 0;
      }
      yearSettings = numbatConfig.stakingV5YearSettings;
    }
    this.logger.log(`getProviderAPR: ${delegationContract} ${serviceFee}. Staking v5: ${stakingV5Settings.enabled}. 
    Protocol sustain rewards: ${protocolSustainabilityRewards}
    Genesis token supply: ${genesisTokenSupply}
    Epochs since genesis: ${epochsSinceGenesis}
    Years settings: ${yearSettings}`, {})

    if (!networkConfig.RoundsPerEpoch) {
      networkConfig.RoundsPerEpoch = networkStats.RoundsPerEpoch;
    }
    const epochDuration = networkConfig.RoundDuration / 1000 * networkConfig.RoundsPerEpoch;
    const secondsInYear = 365 * 24 * 3600;
    const epochsInYear = secondsInYear / epochDuration;

    const inflationRate =
      yearSettings.find(x => x.year === Math.floor(epochsSinceGenesis / epochsInYear) + 1)?.maximumInflation || 0;
    const rewardsPerEpoch = Math.max((inflationRate * genesisTokenSupply) / epochsInYear, feesInEpoch);
    const rewardsPerEpochWithoutProtocolSustainability =
      (1 - protocolSustainabilityRewards) * rewardsPerEpoch;
    const topUpRewardsLimit =
      0.5 * rewardsPerEpochWithoutProtocolSustainability;
    const networkBaseStake = networkStake.totalValidators * stakePerNode;
    const networkTotalStake = parseInt(denominateValue(stakedBalance.toFixed()));

    const networkTopUpStake =
      networkTotalStake -
      networkBaseStake -
      this.loadInactiveValidatorsStake(networkStake, stakePerNode);

    const topUpReward =
      ((2 * topUpRewardsLimit) / Math.PI) *
      Math.atan(
        networkTopUpStake /
        (2 * 2000000)
      );
    const baseReward = rewardsPerEpochWithoutProtocolSustainability - topUpReward;
    const nodeStatuses = ['staked', 'jailed', 'queued'];
    const allNodes = blsKeys.filter(key => nodeStatuses.includes(key.asString())).length;

    const activeNodeStatuses = ['staked'];
    const allActiveNodes = blsKeys.filter(key => activeNodeStatuses.includes(key.asString())).length
      - unqualifiedNodes.length;
    if (allActiveNodes <= 0) {
      return 0;
    }

    // based on validator total stake recalibrate the active nodes.
    // it can happen that an user can unStake some tokens, but the node is still active until the epoch change
    const validatorTotalStake = parseInt(denominateValue(activeStake.asBigInt().toFixed()));
    const actualNumberOfNodes = Math.min(Math.floor(validatorTotalStake / stakePerNode), allActiveNodes);
    const validatorBaseStake = actualNumberOfNodes * stakePerNode;
    const validatorTopUpStake = ((validatorTotalStake - allNodes * stakePerNode) / allNodes) * allActiveNodes;
    const validatorTopUpReward =
      networkTopUpStake > 0 ? (validatorTopUpStake / networkTopUpStake) * topUpReward : 0;
    const validatorBaseReward = (validatorBaseStake / networkBaseStake) * baseReward;
    const anualPercentageRate =
      (epochsInYear * (validatorTopUpReward + validatorBaseReward)) / validatorTotalStake;

    const apr = (anualPercentageRate * (1 - serviceFee / 100 / 100) * 100);
    await this.cacheManager.setProviderAPR(delegationContract, serviceFee, apr);
    return apr;
  }

  private loadInactiveValidatorsStake(networkStake: DharitrIApiNetworkStake, stakePerNode: number): number {
    if (networkStake.inactiveValidators != null) {
      return networkStake.inactiveValidators * stakePerNode;
    }

    return networkStake.queueSize * stakePerNode;
  }

  private async getStakingV5Settings(): Promise<any> {
    const value = await this.cacheManager.getStakingV5Settings();
    if (value !== undefined && value !== null) {
      return value;
    }

    const computedValue = await this.numbatApiService.getStakingV5Settings();
    await this.cacheManager.setStakingV5Settings(computedValue);

    return computedValue;
  }
}
