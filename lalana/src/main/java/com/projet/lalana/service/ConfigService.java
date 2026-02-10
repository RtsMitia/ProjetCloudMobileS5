package com.projet.lalana.service;

import com.projet.lalana.model.Config;
import com.projet.lalana.repository.ConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConfigService {

    private final ConfigRepository repository;

    public List<Config> findAll() {
        return repository.findAll();
    }

    public Optional<Config> findById(Integer id) {
        return repository.findById(id);
    }

    public Optional<Config> findByKey(String key) {
        return repository.findByKey(key);
    }

    @Transactional
    public Config save(Config config) {
        return repository.save(config);
    }

    @Transactional
    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}
