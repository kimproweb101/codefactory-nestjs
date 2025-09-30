import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { EnterChatDto } from './dto/enter-chat.dto';
import { CreateMessagesDto} from './messages/dto/create-messages.dto';
import { ChatsMessagesService } from './messages/messages.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection {
  
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService : ChatsMessagesService
  ){}

  @WebSocketServer() server: Server;

  handleConnection(socket: Socket) {
    console.log(`클라이언트 연결됨: ${socket.id}`);    
  }

  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ){
    const chat =await this.chatsService.createChat(data)
  }
    
  

  @SubscribeMessage('enter_chat')
  async enterChat(
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket,
  ){
    for(const chatId of data.chatIds){
      const exists=await this.chatsService.checkIfChatExists(chatId)
      if(!exists){
        throw new WsException({
          code: 100,
          message:`존재하지 않는 chat 입니다. chatId: ${chatId}`
        })
      }
    }
    
    socket.join(data.chatIds.map((x)=>x.toString()))
  }


  @SubscribeMessage('send_message')
  async sendMessage(
    // @MessageBody() message:{message:string, chatId:number},
    @MessageBody() dto: CreateMessagesDto,
    @ConnectedSocket() socket:Socket,
  ) {
    const chatExists= await this.chatsService.checkIfChatExists(
      dto.chatId
    )

    if(!chatExists){
      throw new WsException(
        `존재하지 않는 채팅방입니다. Chat ID : ${dto.chatId}`
      )
    }

    const message=await this.messagesService.createMessage(
      dto,
    )

    socket.to(message.chat.id.toString()).emit('receive_message', message.message)
  }
}
