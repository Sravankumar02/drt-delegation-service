import { Module } from '@nestjs/common';
import { NumbatCommunicationModule } from '../numbat-communication/numbat-communication.module';
import { ApiMetricsService } from './api.metrics.service';
import { MetricsModule } from '@terradharitri/sdk-nestjs-monitoring';

@Module({
  imports: [
    NumbatCommunicationModule,
    MetricsModule,
  ],
  providers: [
    ApiMetricsService,
  ],
  exports: [
    ApiMetricsService,
  ],
})
export class ApiMetricsModule { }
