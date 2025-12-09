import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(this.checkLogin());
  
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // Verificar si hay sesión guardada
  private checkLogin(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }

  // Login
  login(usuario: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { usuario, password })
      .pipe(
        tap(response => {
          // Guardar sesión simple
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('usuario', JSON.stringify(response.usuario));
          this.loggedIn.next(true);
        })
      );
  }

  // Logout
  logout(): void {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('usuario');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  // Obtener usuario
  getUsuario(): any {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return this.checkLogin();
  }
}