package com.projet.lalana.dto;


import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data


public class SignalementRequest {
    Integer userId;
    Double x;
    Double y;
    String localisation;
    String description;
    LocalDate createdAt;
}
