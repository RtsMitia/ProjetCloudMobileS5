package com.projet.lalana.service;

import com.projet.lalana.model.Probleme;
import com.projet.lalana.repository.ProblemeRepository;
import com.projet.lalana.repository.ProblemeStatusRepository;
import com.projet.lalana.repository.ProblemeHistoryRepository;
import com.projet.lalana.model.ProblemeHistory;
import com.projet.lalana.model.ProblemeStatus;
import java.time.LocalDateTime;
import jakarta.transaction.Transactional;
import java.util.NoSuchElementException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProblemeService {

    private static final Logger logger = LoggerFactory.getLogger(ProblemeService.class);

    private final ProblemeRepository problemeRepository;
    private final ProblemeStatusRepository problemeStatusRepository;
    private final ProblemeHistoryRepository problemeHistoryRepository;

    public List<Probleme> getAll() {
        try {
            return problemeRepository.findAll();
        } catch (Exception e) {
            logger.error("Erreur lors de getAll problemes", e);
            throw new ServiceException("Erreur lors de la récupération des problèmes", e);
        }
    }

    public Optional<Probleme> getById(Integer id) {
        try {
            return problemeRepository.findById(id);
        } catch (Exception e) {
            logger.error("Erreur lors de getById probleme id={}", id, e);
            throw new ServiceException("Erreur lors de la récupération du problème id=" + id, e);
        }
    }

    @Transactional
    public Probleme resoudre(Integer id) {
        try {
            Probleme probleme = problemeRepository.findById(id)
                    .orElseThrow(() -> new ServiceException("Problème non trouvé id=" + id));

            // Assumption: status with id=2 corresponds to the "résolu/terminé" status in the database.
            final Integer RESOLVED_STATUS_ID = 2;
            ProblemeStatus resolvedStatus = problemeStatusRepository.findById(RESOLVED_STATUS_ID)
                    .orElseThrow(() -> new ServiceException("Status résolu introuvable (id=" + RESOLVED_STATUS_ID + ")"));

            probleme.setProblemeStatus(resolvedStatus);
            Probleme saved = problemeRepository.save(probleme);

            ProblemeHistory history = new ProblemeHistory();
            history.setProbleme(saved);
            history.setStatus(resolvedStatus);
            history.setChangedAt(LocalDateTime.now());
            problemeHistoryRepository.save(history);

            return saved;
        } catch (ServiceException se) {
            throw se;
        } catch (Exception e) {
            logger.error("Erreur lors de la résolution du problème id={}", id, e);
            throw new ServiceException("Erreur lors de la résolution du problème id=" + id, e);
        }
    }
    public List<Probleme> findByValeur(Integer valeur) {
        try {
            return problemeRepository.findByValeur(valeur);
        } catch (Exception e) {
            logger.error("Erreur lors de findByValeur valeur={}", valeur, e);
            throw new ServiceException("Erreur lors de la récupération des problèmes par valeur", e);
        }
    }

    @Transactional
    public Probleme markResolved(Integer id) {
        try {
            Probleme p = problemeRepository.findById(id)
                    .orElseThrow(() -> new ServiceException("Problème non trouvé id=" + id));

            ProblemeStatus resolved = problemeStatusRepository.findByValeur(30)
                    .orElseThrow(() -> new ServiceException("Status 'resolu' (valeur=30) introuvable"));

            p.setProblemeStatus(resolved);
            return problemeRepository.save(p);
        } catch (ServiceException se) {
            throw se;
        } catch (Exception e) {
            logger.error("Erreur lors de markResolved probleme id={}", id, e);
            throw new ServiceException("Erreur lors du changement de statut du problème", e);
        }
    }

    
}
