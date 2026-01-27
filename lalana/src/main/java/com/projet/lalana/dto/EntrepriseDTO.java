package com.projet.lalana.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntrepriseDTO {
    private Integer id;
    private String nom;
    private String adresse;
    private String telephone;
    
    // Constructeur pour convertir depuis l'entité
    public EntrepriseDTO(com.projet.lalana.model.Entreprise entreprise) {
        this.id = entreprise.getId();
        this.nom = entreprise.getNom();
        this.adresse = entreprise.getAdresse();
        this.telephone = entreprise.getTelephone();
    }
}