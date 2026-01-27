package com.projet.lalana.service;

import com.projet.lalana.model.Entreprise;
import com.projet.lalana.repository.EntrepriseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EntrepriseService {
    
    @Autowired
    private EntrepriseRepository entrepriseRepository;
    
    public List<Entreprise> getAllEntreprises() {
        return entrepriseRepository.findAll();
    }
    
    public Optional<Entreprise> getEntrepriseById(Integer id) {
        return entrepriseRepository.findById(id);
    }
    
    public Entreprise createEntreprise(Entreprise entreprise) {
        return entrepriseRepository.save(entreprise);
    }
    
    public boolean existsByNom(String nom) {
        return entrepriseRepository.existsByNom(nom);
    }

  
}