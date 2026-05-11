import { Module } from "@nestjs/common";
import { NumbatCommunicationModule } from "../../numbat-communication.module";
import { CacheManagerModule } from "../../../cache-manager/cache-manager.module";
import { NetworkStakeLoaderService } from "./network-stake-loader.service";

@Module({
  imports: [
    CacheManagerModule,
    NumbatCommunicationModule,
  ],
  providers: [
    NetworkStakeLoaderService,
  ],
  exports: [
    NetworkStakeLoaderService,
  ],
})
export class NetworkStakeLoaderModule { }
