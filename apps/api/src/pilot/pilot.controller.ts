import { Controller, Get, Request } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PilotResponse } from '../shared/api-types';
import { PilotService } from './pilot.service';

interface AuthenticatedRequest {
  user?: { sub: string };
}

@ApiTags('pilot')
@Controller('pilot')
export class PilotController {
  constructor(private readonly service: PilotService) {}

  @Get('me')
  @ApiOperation({ summary: 'Name, total flight hours and avatar URL of the signed-in pilot' })
  me(@Request() request: AuthenticatedRequest): Promise<PilotResponse> {
    return this.service.getMe(request.user?.sub);
  }
}
