import { NgModule } from '@angular/core';
import { VendorComponent } from './vendor.component';
import { MaterialModule } from './angular-material/angular-material.module';



@NgModule({
  declarations: [VendorComponent],
  imports: [
    MaterialModule
  ],
  exports: [
    MaterialModule,
    VendorComponent
  ]
})
export class VendorModule { }
