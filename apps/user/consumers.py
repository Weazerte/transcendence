from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import User, UserStatus
import logging

def get_user_status_group_name(user_id):
    return f"user_status_{user_id}"

# Global group for all users to receive status updates
GLOBAL_STATUS_GROUP = "user_status_updates"

logger = logging.getLogger(__name__)

class UserStatusConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']

        # First accept the connection
        await self.accept()

        # Add user to the global status group
        await self.channel_layer.group_add(
            GLOBAL_STATUS_GROUP,
            self.channel_name
        )

        # Update user status to online
        await self.update_user_status(UserStatus.ONLINE)

        # Broadcast the status change to all users
        await self.channel_layer.group_send(
            GLOBAL_STATUS_GROUP,
            {
                "type": "user_status_change",
                "user_id": self.user.id,
                "status": UserStatus.ONLINE,
                "nickname": self.user.nickname
            }
        )

        logger.info(f"User {self.user.id} is now online")

    async def disconnect(self, code):
        # Update user status to offline
        await self.update_user_status(UserStatus.OFFLINE)

        # Broadcast the status change to all users
        await self.channel_layer.group_send(
            GLOBAL_STATUS_GROUP,
            {
                "type": "user_status_change",
                "user_id": self.user.id,
                "status": UserStatus.OFFLINE,
                "nickname": self.user.nickname
            }
        )

        # Remove user from the global status group
        await self.channel_layer.group_discard(
            GLOBAL_STATUS_GROUP,
            self.channel_name
        )

        logger.info(f"User {self.user.id} is now offline")

    @database_sync_to_async
    def update_user_status(self, status):
        user = User.objects.get(id=self.user.id)
        user.status = status
        user.save()

    async def user_status_change(self, event):
        """Handler for receiving status change broadcasts"""
        await self.send_json({
            "type": "status_change",
            "user_id": event["user_id"],
            "status": event["status"],
            "nickname": event["nickname"]
        })