// src/notifications/notifications.service.ts

import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSettings } from './entities/notification-settings.entity';
import { Notification } from './entities/notification.entity'; // 알림 엔티티 추가
import { filter, map } from 'rxjs/operators';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { FindAllNotificationsDto } from './dtos/FindAllNotifications-dto';

interface NotificationMessage {
  userId: number;
  message: string;
}

@Injectable()
export class NotificationsService {
  private notifications = new Subject<NotificationMessage>();
  private activeConnections = new Map<number, boolean>(); // 사용자 ID별 SSE 연결 상태를 저장

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>, // Notification 저장소 주입
    @InjectRepository(NotificationSettings)
    private readonly notificationSettingsRepository: Repository<NotificationSettings>,
  ) {}

  // 특정 사용자의 알림 설정을 가져오기
  async getSettingsForUser(userId: number): Promise<NotificationSettings> {
    let settings = await this.notificationSettingsRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!settings) {
      // 기본 설정 생성 (알림 설정이 없는 경우)
      settings = this.notificationSettingsRepository.create({
        user: { id: userId },
        commentNotifications: true,
        commentlikeNotifications: true,
        postLikeNotifications: true,
      });
      await this.notificationSettingsRepository.save(settings);
    }

    return settings;
  }

  // 댓글 알림 설정 토글
  async toggleCommentNotifications(userId: number): Promise<NotificationSettings> {
    const settings = await this.getSettingsForUser(userId);
    settings.commentNotifications = !settings.commentNotifications;
    return this.notificationSettingsRepository.save(settings);
  }

  // 댓글 좋아요 알림 설정 토글
  async toggleLikeNotifications(userId: number): Promise<NotificationSettings> {
    const settings = await this.getSettingsForUser(userId);
    settings.commentlikeNotifications = !settings.commentlikeNotifications;
    return this.notificationSettingsRepository.save(settings);
  }

  // 포스트 좋아요 알림 설정 토글
  async togglePostLikeNotifications(userId: number): Promise<NotificationSettings> {
    const settings = await this.getSettingsForUser(userId);
    settings.postLikeNotifications = !settings.postLikeNotifications;
    return this.notificationSettingsRepository.save(settings);
  }

   // 구독 알림 설정 토글
async toggleSubscribeNotifications(userId: number): Promise<NotificationSettings> {
  const settings = await this.getSettingsForUser(userId);
  settings.subscribeNotifications = !settings.subscribeNotifications;
  return this.notificationSettingsRepository.save(settings);
}

   // 특정 사용자에 대한 알림 스트림 제공
  getNotificationsForUser(userId: number): Observable<MessageEvent> {
    this.activeConnections.set(userId, true); // 연결 시작 시 활성화 상태로 설정
    return this.notifications.asObservable().pipe(
      filter((notification) => notification.userId === userId),
      map(
        (notification) =>
          ({
            data: { message: notification.message },
          } as MessageEvent),
      ),
    );
  }

  // 알림 전송 및 저장 메서드
  async sendNotification(userId: number, message: string) {
    console.log(`Sending notification to user ${userId}: ${message}`);
    
    // 모든 알림을 데이터베이스에 저장
    await this.notificationRepository.save({
      user: { id: userId },
      message,
      isRead: false, // 초기 상태는 읽지 않음
    });
  
    // 실시간 알림 전송
    this.notifications.next({ userId, message });
    console.log(`Notification sent to user ${userId}`);
  }

  // 사용자의 읽지 않은 알림 조회
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { user: { id: userId }, isRead: false },
      order: { createdAt: 'ASC' },
    });
  }

    // 모든 알림 조회 (읽음 포함) - 페이지네이션 적용
async getAllNotifications(userId: number, findAllNotificationsDto: FindAllNotificationsDto): Promise<Pagination<Notification>> {
  const { page, limit } = findAllNotificationsDto;

  const queryBuilder = this.notificationRepository
    .createQueryBuilder('notification')
    .leftJoinAndSelect('notification.user', 'user')
    .where('notification.user.id = :userId', { userId })
    .orderBy('notification.createdAt', 'DESC');

  const pagination = await paginate<Notification>(queryBuilder, { page, limit });
  return pagination;
}


  // 알림 읽음 처리
  async markNotificationsAsRead(userId: number) {
    await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
  }

   // 사용자 SSE 연결 해제 시 호출
   disconnectUser(userId: number) {
    console.log(`Disconnecting user: ${userId}`);
    this.activeConnections.delete(userId);
  }
}
