import {
  SubscribeMessage, WebSocketGateway,
  ConnectedSocket, WsResponse,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../roles/roles.guard';
import { AllowedRoles } from '../roles/roles.decorator';
import { Roles } from '../roles/roles.enum';
import * as gatewayEvents from './gateway-events.json';
import { WsJwtGuard } from '../authentication/ws.jwt.guard';
import { CheckInResponseViewModel } from './vm';

@WebSocketGateway({ origins: '*:*' })
export class ClubGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private readonly logger = new Logger('Club Gateway');
  connectedJuniors: Socket[] = [];

  handleConnection(client: Socket) {
    this.logger.log(`connected ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedJuniors = this.connectedJuniors.filter(c => c.id !== client.id);
    this.logger.log(`diconnected ${client.id}`);
  }

  @UseGuards(WsJwtGuard, RolesGuard)
  @AllowedRoles(Roles.JUNIOR)
  @SubscribeMessage(gatewayEvents.checkIn)
  checkInEvent(
    @ConnectedSocket() client: Socket,
  ): WsResponse<unknown> {
    const id = client.handshake.query.token;
    this.connectedJuniors[id] = client;
    const response = new CheckInResponseViewModel(true);
    console.log(this.connectedJuniors);
    return { event: gatewayEvents.checkIn, data: response };
  }
}
