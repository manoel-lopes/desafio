import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import type { ListResult } from '../data/vehicle.model';
import { ApiError, isUnreachableApiError, VehiclesService } from '../data/vehicles.service';

export const vehiclesListResolver: ResolveFn<ListResult> = async (route) => {
  const service = inject(VehiclesService);
  const page = Number(route.queryParamMap.get('page')) || 1;
  const pageSize = Number(route.queryParamMap.get('pageSize')) || 20;
  const orderParam = route.queryParamMap.get('order');
  const order = orderParam === 'asc' || orderParam === 'desc' ? orderParam : 'desc';
  try {
    return await service.list({ page, pageSize, order });
  } catch (e) {
    if (e instanceof ApiError || isUnreachableApiError(e)) {
      return {
        page,
        pageSize,
        totalItems: 0,
        totalPages: 0,
        order,
        items: [],
      };
    }
    throw e;
  }
};
