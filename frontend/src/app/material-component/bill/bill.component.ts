import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BillService } from 'src/app/services/bill.service';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { ConfirmationComponent } from '../dialog/confirmation/confirmation.component';
import * as saveAs from 'file-saver';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss']
})
export class BillComponent implements OnInit {
  displayedColumns:string[]=['name','email','contactNumber','paymentMethod','total','view'];
  responseMessage:any;
  dataSource:any;

  constructor(
    private snackbarService:SnackbarService,
    private ngxService:NgxUiLoaderService,
    private categoryService : CategoryService,
    private productService:ProductService,
    private billService:BillService,
    private dialog:MatDialog,
    private router :Router
  ) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.tableData();
  }

  tableData(){
    this.billService.getBills().subscribe((response:any)=>{
      this.ngxService.stop();
      this.dataSource = new MatTableDataSource(response);

    },(error:any)=>{
      this.ngxService.stop();

      if(error.error?.message){
        this.responseMessage=error.error?.message;
      }else{
        this.responseMessage=GlobalConstants.genericError
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error)

    })

  }

  applyFilter(event : Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    
    }
    

    handleViewAction(values:any){
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data={
        data:values
      };
      dialogConfig.width = "100px";
      const dialogRef = this.dialog.open(BillComponent,dialogConfig);
      this.router.events.subscribe(()=>{
        dialogRef.close();
      })

    }
    handleReportAction(values:any){
      this.ngxService.start();
      var data ={
        name:values.name,
        email:values.email,
        uuid:values.uuid,
        contactNumber: values.contactNumber,
        paymentMethod : values.paymentMethod,
        totalAmount : values.total,
        productDetails : values.productDetails
      }
      this.billService.getPdf(data).subscribe((response:any)=>{
           saveAs(response,values.uuid+ '.pdf');
           this.ngxService.stop();
      })


    }
    handleDeleteAction(values:any){
     const dialogConfig = new MatDialogConfig();
     dialogConfig.data = {
      message: ' delete '+ values.name+ ' bill'
     };

     const dialogRef = this.dialog.open(ConfirmationComponent,dialogConfig);
     const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((response)=>{
      this.ngxService.start();
      this.deleteProduct(values.id);
      dialogRef.close();
     })
    }

    deleteProduct(id:any){
      this.billService.delete(id).subscribe((response:any)=>{
        this.ngxService.stop();
        this.tableData();
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage,"success");

      },(error:any)=>{
        this.ngxService.stop();

      if(error.error?.message){
        this.responseMessage=error.error?.message;
      }else{
        this.responseMessage=GlobalConstants.genericError
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error)


      })
    }

}
