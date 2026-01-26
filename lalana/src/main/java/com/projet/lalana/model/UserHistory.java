package com.projet.lalana.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class UserHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime changedAt;

    @Column(nullable = false)
    private Integer status;
}
