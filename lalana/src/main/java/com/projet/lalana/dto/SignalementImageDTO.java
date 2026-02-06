package com.projet.lalana.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalementImageDTO {
    private String cheminLocal;
    private String cheminOnline;
    private String nomFichier;
}
