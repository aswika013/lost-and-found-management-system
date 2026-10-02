package com.github.aswika013.lost_and_found_manager.repository;

import com.github.aswika013.lost_and_found_manager.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
}