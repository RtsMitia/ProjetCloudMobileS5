package com.projet.lalana.controller;

import com.projet.lalana.model.UserHistory;
import com.projet.lalana.dto.UserDTO;
import com.projet.lalana.dto.LoginRequest;
import com.projet.lalana.model.User;
import com.projet.lalana.response.ApiResponse;
import com.projet.lalana.service.ServiceException;
import com.projet.lalana.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    @GetMapping 
    public ApiResponse getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return new ApiResponse(true, "Liste des utilisateurs récupérée", users);
        } catch (ServiceException se) {
            logger.error("ServiceException getAllUsers", se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error getAllUsers", e);
            return new ApiResponse(false, "Erreur serveur lors de la récupération des utilisateurs", null);
        }
    }
    @GetMapping("/{id}")
    public ApiResponse getUserById(@PathVariable Integer id) {
        try {
            User user = userService.getUserById(id);
            return new ApiResponse(true, "Utilisateur récupéré", user);
        } catch (ServiceException se) {
            logger.error("ServiceException getUserById id={}", id, se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error getUserById id={}", id, e);
            return new ApiResponse(false, "Erreur serveur lors de la récupération de l'utilisateur", null);
        }
    }

    @PostMapping("/{id}/deblock")
    public ApiResponse deblockUser(@PathVariable Integer id,
                                                   @RequestParam(required = false) String note) {
        try {
            UserHistory history = userService.deblockUser(id, note);
            return new ApiResponse(true, "Utilisateur débloqué", history);
        } catch (ServiceException se) {
            logger.error("ServiceException deblockUser id={}", id, se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error deblockUser id={}", id, e);
            return new ApiResponse(false, "Erreur serveur lors du déblocage de l'utilisateur", null);
        }
    }

    @GetMapping("/sync/block")
    public ApiResponse syncBlockedUsersFromFirebase() {
        try {
            List<UserHistory> histories = userService.getDatasFromFirebase();
            return new ApiResponse(true, "Synchronisation des utilisateurs bloqués depuis Firebase terminée", histories);
        } catch (ServiceException se) {
            logger.error("ServiceException syncBlockedUsersFromFirebase", se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error syncBlockedUsersFromFirebase", e);
            return new ApiResponse(false, "Erreur serveur lors de la synchronisation des utilisateurs bloqués", null);
        }
    }

    @GetMapping("/sync/unblock")
    public ApiResponse syncUnblockedUsersToFirebase() {
        try {
            List<User> users = userService.syncUnblockedUserToFirebase();
            return new ApiResponse(true, "Synchronisation des utilisateurs débloqués vers Firebase terminée", users);
        } catch (ServiceException se) {
            logger.error("ServiceException syncUnblockedUsersToFirebase", se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error syncUnblockedUsersToFirebase", e);
            return new ApiResponse(false, "Erreur serveur lors de la synchronisation des utilisateurs débloqués", null);
        }
    }

    @PutMapping("/{id}")
    public ApiResponse updateUser(@PathVariable Integer id, @RequestBody UserDTO updatedUser)  {
        try {
            updatedUser.setId(id);
            User saved = userService.updateUserFromDTO(updatedUser);
            return new ApiResponse(true, "Utilisateur mis à jour", saved);
        } catch (ServiceException se) {
            logger.error("ServiceException updateUser id={}", id, se);
            return new ApiResponse(false, se.getMessage(), null);
        } catch (Exception e) {
            logger.error("Unexpected error updateUser id={}", id, e);
            return new ApiResponse(false, "Erreur serveur lors de la mise à jour de l'utilisateur", null);
        }
    }
}
