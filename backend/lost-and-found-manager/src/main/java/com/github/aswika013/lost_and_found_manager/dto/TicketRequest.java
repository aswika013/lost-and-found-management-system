package com.github.aswika013.lost_and_found_manager.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@JsonIgnoreProperties(ignoreUnknown = true)   // extra fields like "status" are ignored
public record TicketRequest(

        @NotBlank(message = "Item name is required")
        @Size(max = 100, message = "Item name must be under 100 characters")
        String itemName,

        @NotBlank(message = "Category is required")
        String category,

        @NotNull(message = "Date is required")
        @PastOrPresent(message = "Date cannot be in the future")
        LocalDate eventDate,

        @NotBlank(message = "Place is required")
        @Size(max = 150, message = "Place must be under 150 characters")
        String location,

        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be under 100 characters")
        String contactName,

        @NotBlank(message = "Phone or email is required")
        @Pattern(regexp = "^(\\+?[0-9 ()-]{7,20}|[^@\\s]+@[^@\\s]+\\.[^@\\s]+)$",
                 message = "Enter a valid phone number or email")
        String contactInfo,

        @Size(max = 1000, message = "Description must be under 1000 characters")
        String description,

        @NotBlank(message = "Type is required")
        @Pattern(regexp = "LOST|FOUND", message = "Type must be LOST or FOUND")
        String type
) {}
