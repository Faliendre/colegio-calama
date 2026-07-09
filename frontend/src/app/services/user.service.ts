import { CONFIG } from '../config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id?: number;
  username: string;
  name: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  role: string;
  password?: string;
  created_at?: string;
}


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${CONFIG.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // Obtener todos los usuarios
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // Obtener un usuario por ID
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Crear nuevo usuario
  createUser(user: User): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }

  // Actualizar usuario
  updateUser(id: number, user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, user);
  }

  // Eliminar usuario
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
   // Obtener usuarios por rol
  getUsuarios(params?: any): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { params });
  }
}
