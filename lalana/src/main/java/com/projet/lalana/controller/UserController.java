package com.projet.lalana.controller;

import com.projet.lalana.model.UserHistory;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

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
}
