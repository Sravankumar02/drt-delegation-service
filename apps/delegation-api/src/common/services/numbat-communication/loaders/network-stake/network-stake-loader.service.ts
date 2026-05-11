import { Injectable } from "@nestjs/common";
import { NumbatApiService } from "../../numbat-api.service";
import { CacheManagerService } from "../../../cache-manager/cache-manager.service";
import { DharitrIApiNetworkStake } from "../../models/network-stake.dto";
import { Constants } from "@terradharitri/sdk-nestjs-common";

@Injectable()
export class NetworkStakeLoaderService {
  constructor(
    private readonly cacheManager: CacheManagerService,
    private readonly numbatApiService: NumbatApiService,
  ) { }


  async load(): Promise<DharitrIApiNetworkStake | undefined> {
    const cached = await this.cacheManager.get<DharitrIApiNetworkStake>(this.getCacheKey());
    if (cached != null) {
      return cached;
    }

    const networkStake = await this.numbatApiService.getNetworkStake();
    if (networkStake == null) {
      return;
    }

    await this.cacheManager.set(this.getCacheKey(), networkStake, Constants.oneMinute() * 10);

    return networkStake;
  }

  private getCacheKey(): string {
    return `${NetworkStakeLoaderService.name}.networkStake`;
  }
}
