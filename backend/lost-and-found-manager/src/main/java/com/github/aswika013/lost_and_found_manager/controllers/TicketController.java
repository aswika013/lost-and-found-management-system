package com.github.aswika013.lost_and_found_manager.controllers;

import com.github.aswika013.lost_and_found_manager.entity.Ticket;
import com.github.aswika013.lost_and_found_manager.repository.TicketRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
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
    public Ticket create(@RequestBody Ticket ticket) {
        return repository.save(ticket);
    }

    @GetMapping("/{id}")
    public Ticket getOne(@PathVariable Long id) {
        return repository.findById(id).orElseThrow();
    }

  @PutMapping("/{id}")
public Ticket update(@PathVariable Long id, @RequestBody Ticket updated) {
    Ticket ticket = repository.findById(id).orElseThrow();
    ticket.setItemName(updated.getItemName());
    ticket.setCategory(updated.getCategory());
    ticket.setEventDate(updated.getEventDate());
    ticket.setLocation(updated.getLocation());
    ticket.setContactName(updated.getContactName());
    ticket.setContactInfo(updated.getContactInfo());
    ticket.setDescription(updated.getDescription());
    ticket.setType(updated.getType());
    ticket.setStatus(updated.getStatus());
    return repository.save(ticket);
}

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}