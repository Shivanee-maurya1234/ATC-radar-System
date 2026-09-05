package com.atc.model;

import jakarta.persistence.*;

@Entity
@Table(name = "flights")
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String callsign;

    private double x;
    private double y;
    private double vx;
    private double vy;
    private String altitude;
    private String status;

    public Flight() {}

    public Flight(String callsign, double x, double y, double vx, double vy, String altitude, String status) {
        this.callsign = callsign;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.altitude = altitude;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getCallsign() { return callsign; }
    public void setCallsign(String callsign) { this.callsign = callsign; }
    public double getX() { return x; }
    public void setX(double x) { this.x = x; }
    public double getY() { return y; }
    public void setY(double y) { this.y = y; }
    public double getVx() { return vx; }
    public void setVx(double vx) { this.vx = vx; }
    public double getVy() { return vy; }
    public void setVy(double vy) { this.vy = vy; }
    public String getAltitude() { return altitude; }
    public void setAltitude(String altitude) { this.altitude = altitude; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}