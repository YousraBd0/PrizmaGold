package com.PrizmaGold.service;

import com.PrizmaGold.client.PythonClient;
import com.PrizmaGold.model.*;
import com.PrizmaGold.store.SessionStore;
import org.springframework.stereotype.Service;

import java.util.List;

import com.PrizmaGold.entity.Design;
import com.PrizmaGold.repository.DesignRepository;
import java.time.ZonedDateTime;

@Service
public class DesignService {

    private final SessionStore sessionStore;
    private final PythonClient pythonClient;
    private final DesignRepository designRepository;

    public DesignService(SessionStore sessionStore, PythonClient pythonClient, DesignRepository designRepository) {
        this.sessionStore = sessionStore;
        this.pythonClient = pythonClient;
        this.designRepository = designRepository;
    }

    public GenerateResponse processDesign(GenerateRequest request) {
        // 1. Load existing history
        List<Message> history = sessionStore.getHistory(request.getSessionId());

        // 2. Add user message
        history.add(new Message("user", request.getPrompt()));

        // 3. Build Python request
        PythonRequest pythonReq = new PythonRequest(
            request.getPrompt(),
            history,
            request.getCurrentSpecs()
        );

        // 4. Call Python
        PythonResponse pythonResp = pythonClient.callPythonService(pythonReq);

        // 5. Add AI response to history
        history.add(new Message("assistant", pythonResp.getImage_url()));

        // 6. Save history
        sessionStore.saveHistory(request.getSessionId(), history);

        // 7. Return response
        return new GenerateResponse(
            pythonResp.getImage_url(),
            null,
            pythonResp.getImage_url()
        );
    }

    public Design saveDesign(DesignDTO dto) {
        Design design = Design.builder()
                .title(dto.getTitle() != null ? dto.getTitle() : "Untitled Design")
                .jewelryType(dto.getJewelryType() != null ? dto.getJewelryType() : "Unknown")
                .metalType(dto.getMetalType() != null ? dto.getMetalType() : "Unknown")
                .imageUrl(dto.getImageUrl())
                .userId(dto.getUserId())
                .createdAt(ZonedDateTime.now())
                .build();
        return designRepository.save(design);
    }
}