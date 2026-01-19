
package com.projet.lalana.service;

import com.projet.lalana.model.Signalement;
import com.projet.lalana.repository.SignalementRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SignalementService {

    private static final Logger logger = LoggerFactory.getLogger(SignalementService.class);

    private final SignalementRepository signalementRepository;

    public List<Signalement> getAll() {
        try {
            return signalementRepository.findAll();
        } catch (Exception e) {
            logger.error("Erreur lors de getAll signalements", e);
            throw new ServiceException("Erreur lors de la récupération des signalements", e);
        }
    }

    public Optional<Signalement> getById(Integer id) {
        try {
            return signalementRepository.findById(id);
        } catch (Exception e) {
            logger.error("Erreur lors de getById signalement id={}", id, e);
            throw new ServiceException("Erreur lors de la récupération du signalement id=" + id, e);
        }
    }
}
