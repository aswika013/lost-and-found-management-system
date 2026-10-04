package com.github.aswika013.lost_and_found_manager.exception;

public class TicketNotFoundException extends RuntimeException {
    public TicketNotFoundException(Long id) {
        super("Ticket " + id + " was not found");
    }
}
