package com.projet.lalana.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "signalement_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class SignalementHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "signalement_id")
    private Signalement signalement;

    @ManyToOne
    @JoinColumn(name = "status_id")
    private SignalementStatus status;

    private LocalDateTime changedAt;
}
