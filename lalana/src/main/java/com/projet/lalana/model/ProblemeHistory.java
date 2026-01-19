package com.projet.lalana.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "probleme_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ProblemeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "probleme_id")
    private Probleme probleme;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id")
    private ProblemeStatus status;

    private LocalDateTime changedAt;
}
