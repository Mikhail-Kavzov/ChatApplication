package com.example.chat.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;


@Component
public class SocketEvent {

    private static final Logger logger = LoggerFactory.getLogger(SocketEvent.class);

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;


    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        logger.info("New connection");
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String uid = (String) headerAccessor.getSessionAttributes().get("uid");
        MySqlConnector.QueryNonSelect("UPDATE " + ChatServerController.usersTable+ " SET isConnected = false WHERE id = "+uid);

    }
}
