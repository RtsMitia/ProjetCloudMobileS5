package com.projet.lalana.dto;

import com.projet.lalana.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO used when updating a user via API or service layer.
 * Contains only fields allowed to be updated from clients.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
	private Integer id;
	private String email;
	private String password;
	private Integer currentStatus;
	private String firebaseToken;

	public static UserDTO fromEntity(User u) {
		if (u == null) return null;
		return new UserDTO(u.getId(), u.getEmail(), null, u.getCurrentStatus(), u.getFirebaseToken());
	}

	/**
	 * Apply the DTO fields to an existing User entity (mutating) or create a new one.
	 */
	public User toEntity() {
		User u = new User();
		u.setId(this.id);
		u.setEmail(this.email);
		if (this.password != null) u.setPassword(this.password);
		u.setCurrentStatus(this.currentStatus != null ? this.currentStatus : -1);
		u.setFirebaseToken(this.firebaseToken);
		return u;
	}
}
