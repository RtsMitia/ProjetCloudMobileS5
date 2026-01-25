package com.projet.lalana.service;

import com.projet.lalana.model.Probleme;
import com.projet.lalana.repository.ProblemeRepository;
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

    public List<Probleme> findByValeur(Integer valeur) {
        try {
            return problemeRepository.findByValeur(valeur);
        } catch (Exception e) {
            logger.error("Erreur lors de findByValeur valeur={}", valeur, e);
            throw new ServiceException("Erreur lors de la récupération des problèmes par valeur", e);
        }
    }

    
}
