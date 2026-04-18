import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TimeoutError, firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  fromApiList,
  fromApiVehicle,
  toApiCreateBody,
  toApiUpdateBody,
  type ApiPaginatedVehicles,
  type ApiVehicle,
} from './vehicle-api.mapper';
import type {
  CreateVehicleInput,
  ListParams,
  ListResult,
  UpdateVehicleInput,
  Vehicle,
} from './vehicle.model';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function messageFromHttpBody(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const msg = (body as { message?: unknown }).message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg) && msg.every((x) => typeof x === 'string')) {
    return msg.join(', ');
  }
  return undefined;
}

const API_REQUEST_MS = 8000;

function toApiError(err: unknown, fallback: string): ApiError {
  if (err instanceof TimeoutError) {
    return new ApiError(0, 'Tempo de espera da API esgotado');
  }
  if (err instanceof HttpErrorResponse) {
    const fromBody = messageFromHttpBody(err.error);
    const message = fromBody ?? err.message ?? fallback;
    return new ApiError(err.status, message);
  }
  return new ApiError(0, fallback);
}

/** True when the API is unreachable (prerender, SSR, or browser offline). */
export function isUnreachableApiError(e: unknown): boolean {
  if (e instanceof ApiError && e.status === 0) return true;
  if (e instanceof TimeoutError) return true;
  if (e instanceof TypeError) return true;
  if (e instanceof DOMException && (e.name === 'AbortError' || e.name === 'TimeoutError')) {
    return true;
  }
  const m = e instanceof Error ? e.message : '';
  return /fetch failed|Failed to fetch|ECONNREFUSED|ENOTFOUND|NetworkError|aborted due to timeout/i.test(
    m,
  );
}

@Injectable({ providedIn: 'root' })
export class VehiclesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/vehicles`;

  async list(params: ListParams = {}): Promise<ListResult> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', String(params.page));
    if (params.pageSize !== undefined) {
      httpParams = httpParams.set('pageSize', String(params.pageSize));
    }
    if (params.order !== undefined) httpParams = httpParams.set('order', params.order);

    try {
      const response = await firstValueFrom(
        this.http
          .get<ApiPaginatedVehicles>(this.baseUrl, { params: httpParams })
          .pipe(timeout(API_REQUEST_MS)),
      );
      return fromApiList(response);
    } catch (err) {
      throw toApiError(err, 'Erro ao listar veículos');
    }
  }

  async getById(id: string): Promise<Vehicle> {
    try {
      const response = await firstValueFrom(
        this.http
          .get<ApiVehicle>(`${this.baseUrl}/${encodeURIComponent(id)}`)
          .pipe(timeout(API_REQUEST_MS)),
      );
      return fromApiVehicle(response);
    } catch (err) {
      throw toApiError(err, 'Erro ao buscar veículo');
    }
  }

  async create(input: CreateVehicleInput): Promise<Vehicle> {
    try {
      const response = await firstValueFrom(
        this.http
          .post<ApiVehicle>(this.baseUrl, toApiCreateBody(input))
          .pipe(timeout(API_REQUEST_MS)),
      );
      return fromApiVehicle(response);
    } catch (err) {
      throw toApiError(err, 'Erro ao cadastrar veículo');
    }
  }

  async update(id: string, input: UpdateVehicleInput): Promise<Vehicle> {
    try {
      const response = await firstValueFrom(
        this.http
          .patch<ApiVehicle>(
            `${this.baseUrl}/${encodeURIComponent(id)}`,
            toApiUpdateBody(input),
          )
          .pipe(timeout(API_REQUEST_MS)),
      );
      return fromApiVehicle(response);
    } catch (err) {
      throw toApiError(err, 'Erro ao atualizar veículo');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http
          .delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`)
          .pipe(timeout(API_REQUEST_MS)),
      );
    } catch (err) {
      throw toApiError(err, 'Erro ao excluir veículo');
    }
  }
}
