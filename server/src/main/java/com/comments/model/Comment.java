package com.comments.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name")
    private String name;

    @Email(message = "Некорректный формат email")
    @Column(name = "email")
    private String email;

    @Column(name = "comment")
    private String comment;
}