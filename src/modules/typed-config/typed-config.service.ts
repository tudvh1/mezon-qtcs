import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { EnvironmentVariables, LeafTypes, Leaves, Paths, PathTypes } from './typed-config.interface'

@Injectable()
export class TypedConfigService {
  constructor(private configService: ConfigService) {}

  // Get values of leaves
  get<T extends Leaves<EnvironmentVariables>>(propertyPath: T): LeafTypes<EnvironmentVariables, T> {
    return this.configService.get(propertyPath)!
  }

  // Get values of all paths
  getObject<T extends Paths<EnvironmentVariables>>(
    propertyPath: T,
  ): PathTypes<EnvironmentVariables, T> {
    return this.configService.get(propertyPath)!
  }
}
