package com.github.aswika013.lost_and_found_manager.controllers;

import com.github.aswika013.lost_and_found_manager.entity.Ticket;
import com.github.aswika013.lost_and_found_manager.repository.TicketRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;
import com.github.aswika013.lost_and_found_manager.dto.TicketRequest;
import com.github.aswika013.lost_and_found_manager.exception.TicketNotFoundException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository repository;

    public TicketController(TicketRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Ticket> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Ticket create(@Valid @RequestBody TicketRequest request) {
        Ticket ticket = new Ticket();
        apply(request, ticket);
        return repository.save(ticket);
    }

    @GetMapping("/{id}")
    public Ticket getOne(@PathVariable Long id) {
        return repository.findById(id).orElseThrow(() -> new TicketNotFoundException(id));
    }

    @PutMapping("/{id}")
    public Ticket update(@PathVariable Long id, @Valid @RequestBody TicketRequest request) {
        Ticket ticket = repository.findById(id).orElseThrow(() -> new TicketNotFoundException(id));
        apply(request, ticket);
        return repository.save(ticket);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }


@PatchMapping("/{id}/status")
public Ticket updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
    String status = body.get("status");
    if (!List.of("OPEN", "MATCHED", "RETURNED").contains(status)) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
    }
    Ticket ticket = repository.findById(id).orElseThrow();
    ticket.setStatus(status);
    return repository.save(ticket);
}

    @PostMapping("/{id}/image")
    public Ticket uploadImage(@PathVariable Long id,
                              @RequestParam("file") MultipartFile file) throws IOException {
        String type = file.getContentType();
        String ext;
        if ("image/jpeg".equals(type)) ext = ".jpg";
        else if ("image/png".equals(type)) ext = ".png";
        else if ("image/webp".equals(type)) ext = ".webp";
        else throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPG, PNG or WEBP images");

        Ticket ticket = repository.findById(id).orElseThrow();

        Path folder = Paths.get("uploads");
        Files.createDirectories(folder);
        String filename = UUID.randomUUID() + ext;
        Files.copy(file.getInputStream(), folder.resolve(filename));

        ticket.setImageUrl("/uploads/" + filename);
        return repository.save(ticket);
    }

    private void apply(TicketRequest r, Ticket t) {
        t.setItemName(r.itemName());
        t.setCategory(r.category());
        t.setEventDate(r.eventDate());
        t.setLocation(r.location());
        t.setContactName(r.contactName());
        t.setContactInfo(r.contactInfo());
        t.setDescription(r.description());
        t.setType(r.type());
    }

}