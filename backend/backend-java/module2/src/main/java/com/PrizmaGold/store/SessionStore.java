package com.PrizmaGold.store;

import com.PrizmaGold.model.Message;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionStore {

    private final Map<String, List<Message>> sessions = new ConcurrentHashMap<>();

    public List<Message> getHistory(String sessionId) {
        return sessions.computeIfAbsent(sessionId, k -> new ArrayList<>());
    }

    public void saveHistory(String sessionId, List<Message> history) {
        sessions.put(sessionId, history);
    }

    public void clearSession(String sessionId) {
        sessions.remove(sessionId);
    }
}