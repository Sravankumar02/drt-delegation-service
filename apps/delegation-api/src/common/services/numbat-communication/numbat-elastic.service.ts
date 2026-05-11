import { Inject, Injectable } from '@nestjs/common';
import { numbatConfig } from '../../../config';
import { Client } from '@elastic/elasticsearch';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ContractDeployTx, ElasticTransaction } from '../../../models';
import { AddressActiveContract } from '../../../models/address-active-contract';

/**
 * Service used for Numbat Elastic endpoint requests;
 */
@Injectable()
export class NumbatElasticService {
  /**
   * Elastic search client
   */
  private transactionsClient: Client;
  private scDeploysClient: Client;
  private delegatorsClient: Client;
  private readonly PAGE_SIZE = 200;
  /**
   * Set the correct host to be used
   */
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {
    this.transactionsClient = new Client({
      node: numbatConfig.elastic + '/transactions',
      requestTimeout: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      agent: {
        keepAlive: true,
        keepAliveMsecs: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      },
    });

    this.scDeploysClient = new Client({
      node: numbatConfig.elastic + '/scdeploys',
      requestTimeout: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      agent: {
        keepAlive: true,
        keepAliveMsecs: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      },
    });

    this.delegatorsClient = new Client({
      node: numbatConfig.elastic + '/delegators',
      requestTimeout: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      agent: {
        keepAlive: true,
        keepAliveMsecs: parseInt(process.env.KEEPALIVE_TIMEOUT_DOWNSTREAM),
      },
    });
  }

  async getStakingContractDeploysTxHashes(): Promise<ContractDeployTx[]> {
    const stakingContractAddress = numbatConfig.stakingContract;
    const body = {
      'query': {
        'bool': {
          'must': [
            {
              'match': {
                'deployer': stakingContractAddress,
              },
            },
          ],
        },
      },
    };
    try {
      const response = await this.scDeploysClient.search({
        body,
      });
      return response.body.hits.hits.map(hit => {
        return {
          txHash: hit._source?.deployTxHash,
          contract: hit._id,
        };
      });
    } catch (e) {
      this.logger.error('Fail to getStakingContractDeploysTxHashes', {
        path: 'numbat-elastic.service.getStakingContractDeploysTxHashes',
        exception: e.toString(),
      });
      throw e;
    }
  }

  async getTransactionsByHashes(txHashes: string[]): Promise<ElasticTransaction[]> {
    const body = {
      query: {
        ids: {
          values: txHashes,
        },
      },
    };
    try {
      const response = await this.transactionsClient.search({
        body,
      });

      return response.body.hits?.hits?.map(hit => {
        return {
          hash: hit._id,
          ...hit._source,
        };
      });
    } catch (e) {
      this.logger.error('Fail to getTransactionByHashes', {
        path: 'numbat-elastic.service.getTransactionByHashes',
        exception: e.toString(),
      });
      throw e;
    }
  }

  async getAddressActiveContracts(address: string): Promise<AddressActiveContract[]> {
    const body = {
      size: 200,
      'query': {
        'bool': {
          'must': [
            {
              'match': {
                'address': address,
              },
            },
          ],
        },
      },
    };
    try {
      const response = await this.delegatorsClient.search({
        body,
      });
      return response.body.hits.hits.map(hit => hit._source);
    } catch (e) {
      this.logger.error('Fail to getDelegationsForAddress', {
        path: 'numbat-elastic.service.getDelegationsForAddress',
        exception: e.toString(),
      });
      throw e;
    }
  }

  async getDelegationForAddressAndContract(address: string, contract: string): Promise<AddressActiveContract | null> {
    const body = {
      'query': {
        'bool': {
          'must': [
            {
              'match': {
                'address': address,
              },
            },
            {
              'match': {
                'contract': contract,
              },
            },
          ],
        },
      },
    };
    try {
      const response = await this.delegatorsClient.search({
        body,
      });
      if (response.body.hits.hits.length) {
        return response.body.hits.hits[0]._source;
      } else {
        return null;
      }
    } catch (e) {
      this.logger.error('Fail to getDelegatorsForAddress', {
        path: 'numbat-elastic.service.getDelegatorsForAddress',
        exception: e.toString(),
      });
      throw e;
    }
  }

  async getDelegationsForContract(contract: string, page: number): Promise<AddressActiveContract[] | null> {
    const body = {
      from: (page - 1) * this.PAGE_SIZE,
      size: this.PAGE_SIZE,
      'query': {
        'bool': {
          'must': [
            {
              'match': {
                'contract': contract,
              },
            },
          ],
        },
      },
    };
    try {
      const response = await this.delegatorsClient.search({
        body,
      });
      if (response.body.hits.hits.length) {
        return response.body.hits.hits.map(e => e._source);
      } else {
        return null;
      }
    } catch (e) {
      this.logger.error('Fail to getDelegationsForContract', {
        path: 'numbat-elastic.service.getDelegationsForContract',
        exception: e.toString(),
      });
      throw e;
    }
  }
}
