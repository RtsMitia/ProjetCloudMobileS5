package com.projet.lalana.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "signalement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Signalement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "point_id")
    private Point point;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "status_id")
    private SignalementStatus status;
}
