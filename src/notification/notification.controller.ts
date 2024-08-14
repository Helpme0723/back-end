import { Controller, Get, Post, Sse, Delete, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notification.service';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserInfo } from 'src/auth/decorators/user-info.decorator';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService // JWT 서비스를 주입합니다.
  ) {}

  // SSE 엔드포인트
  @Sse('stream')
  streamNotifications(@Query('token') token: string): Observable<MessageEvent> {
    try {
      const payload = this.jwtService.verify(token); // 토큰을 검증하고 사용자 정보를 가져옵니다.
      return this.notificationsService.getNotificationsForUser(payload.id);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // SSE 연결 해제 엔드포인트
  @Delete('disconnect')
  disconnectNotifications(@Query('token') token: string) {
    try {
      const payload = this.jwtService.verify(token); // 토큰을 검증하고 사용자 정보를 가져옵니다.
      this.notificationsService.disconnectUser(payload.id);
      return {
        statusCode: 200,
        message: 'SSE connection closed successfully',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

   // 읽지 않은 알림 조회
   @UseGuards(AuthGuard('jwt'))
   @Get('unread')
   async getUnreadNotifications(@UserInfo() user: User) {
     const notifications = await this.notificationsService.getUnreadNotifications(user.id);
     return {
       statusCode: 200,
       message: '읽지 않은 알림들입니다.',
       data: notifications,
     };
   }
 
   // 모든 알림 조회
   @UseGuards(AuthGuard('jwt'))
   @Get('all')
   async getAllNotifications(@UserInfo() user: User) {
     const notifications = await this.notificationsService.getAllNotifications(user.id);
     return {
       statusCode: 200,
       message: '모든 알림을 조회합니다',
       data: notifications,
     };
   }
 
   // 알림 읽음 처리
   @UseGuards(AuthGuard('jwt'))
   @Post('read')
   async markNotificationsAsRead(@UserInfo() user: User) {
     await this.notificationsService.markNotificationsAsRead(user.id);
     return {
       statusCode: 200,
       message: '읽음 상태로 처리완료',
     };
   }
 
   // 댓글 알림 설정 토글
   @UseGuards(AuthGuard('jwt'))
   @Post('settings/comment')
   async toggleCommentNotifications(@UserInfo() user: User) {
     const updatedSettings = await this.notificationsService.toggleCommentNotifications(user.id);
     return {
       statusCode: 200,
       message: '상태변경 성공',
       data: {
         commentNotifications: updatedSettings.commentNotifications,
       },
     };
   }
 
   // 댓글 좋아요 알림 설정 토글
   @UseGuards(AuthGuard('jwt'))
   @Post('settings/comment/like')
   async toggleLikeNotifications(@UserInfo() user: User) {
     const updatedSettings = await this.notificationsService.toggleLikeNotifications(user.id);
     return {
       statusCode: 200,
       message: '상태변경 성공',
       data: {
         commentlikeNotifications: updatedSettings.commentlikeNotifications,
       },
     };
   }
 
   // 포스트 좋아요 알림 설정 토글
   @UseGuards(AuthGuard('jwt'))
   @Post('settings/post/like')
   async togglePostLikeNotifications(@UserInfo() user: User) {
     const updatedSettings = await this.notificationsService.togglePostLikeNotifications(user.id);
     return {
       statusCode: 200,
       message: '상태변경 성공',
       data: {
         postLikeNotifications: updatedSettings.postLikeNotifications,
       },
     };
   }
 
   // 알림 설정 조회
   @UseGuards(AuthGuard('jwt'))
   @Get('settings')
   async getNotificationSettings(@UserInfo() user: User) {
     const settings = await this.notificationsService.getSettingsForUser(user.id);
     return {
       statusCode: 200,
       message: '내 알림 설정을 조회합니다.',
       data: settings,
     };
   }
 }
 