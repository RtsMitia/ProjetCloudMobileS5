package com.projet.lalana.service;

import com.projet.lalana.model.User;
import com.projet.lalana.model.UserHistory;
import com.projet.lalana.repository.UserHistoryRepository;
import com.projet.lalana.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final UserHistoryRepository userHistoryRepository;

    public UserHistory deblockUser(Integer userId, String note) {
        try {
            Optional<User> uopt = userRepository.findById(userId);
            if (uopt.isEmpty()) {
                throw new ServiceException("Utilisateur non trouvé id=" + userId);
            }
            User user = uopt.get();

            UserHistory history = new UserHistory();
            history.setUser(user);
            history.setDescription(note != null && !note.isEmpty() ? note : "Débloqué");
            history.setChangedAt(LocalDateTime.now());
            history.setStatus(1); 

            UserHistory saved = userHistoryRepository.save(history);
            logger.info("User {} débloqué, history id={}", userId, saved.getId());
            return saved;
        } catch (ServiceException se) {
            throw se;
        } catch (Exception e) {
            logger.error("Erreur lors du déblocage de l'utilisateur id={}", userId, e);
            throw new ServiceException("Erreur lors du déblocage de l'utilisateur", e);
        }
    }
}
