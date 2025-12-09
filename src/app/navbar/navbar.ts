import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  isLoggedIn: boolean = false;
  usuario: any = null;
  isDropdownOpen: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Escuchar cambios en el estado de login
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.usuario = this.authService.getUsuario();
      } else {
        this.usuario = null;
      }
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout(): void {
    // Cerrar el dropdown
    this.isDropdownOpen = false;
    
    // Realizar el logout
    this.authService.logout();
  }
}