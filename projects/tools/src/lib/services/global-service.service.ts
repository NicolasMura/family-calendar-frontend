import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ErrorHandlingService } from './error-handling.service';


@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  constructor(
    protected errorHandlingService: ErrorHandlingService
  ) { }

  handleError(error: any): Observable<HttpErrorResponse | Error | any> {
    // send error notification to user
    this.errorHandlingService.handleError(error);
    // Re-throw it back to service or component
    return throwError(error);
  }
}
