import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { CategoryComponent } from '../dialog/category/category.component';
import { ProductComponent } from '../dialog/product/product.component';
import { ConfirmationComponent } from '../dialog/confirmation/confirmation.component';

@Component({
  selector: 'app-manage-product',
  templateUrl: './manage-product.component.html',
  styleUrls: ['./manage-product.component.scss']
})
export class ManageProductComponent implements OnInit {
  displayedColumns:string[]=['name','category','description','price','edit'];
  responseMessage:any;
  dataSource:any;

  constructor(
    private snackbarService:SnackbarService,
    private userService: UserService,
    private dialog: MatDialog,
    private ngxService:NgxUiLoaderService,
    private productService : ProductService,
    private router : Router
  ) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.tableData();
  }

  tableData(){
    this.productService.getProducts().subscribe((response:any)=>{
      this.ngxService.stop();
      this.dataSource = new MatTableDataSource(response);
    },(error:any)=>{
      this.ngxService.stop();
      if(error.error?.message)
      {
        this.responseMessage = error.error?.message;
      }
      else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
    });

  
  }

  applyFilter(event : Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    
    }
    handleAddAction(){

      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        action : 'Add'
      }
      dialogConfig.width ="850px"
      const dialogRef = this.dialog.open(ProductComponent,dialogConfig);
      this.router.events.subscribe(()=>{
        dialogRef.close();
      });
      const sub  = dialogRef.componentInstance.onAddPRoduct.subscribe(
        (response)=>{
          this.tableData();
        }
      )
  
    }
  
    handleEditAction(data:any){
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data = {
        action : 'Edit',
        data:data
      }
      dialogConfig.width ="850px"
      const dialogRef = this.dialog.open(ProductComponent,dialogConfig);
      this.router.events.subscribe(()=>{
        dialogRef.close();
      });
      const sub  = dialogRef.componentInstance.onAddPRoduct.subscribe(
        (response)=>{
          this.tableData();
        }
      )
  
      
  
    }

    handleDeleteAction(data:any){
      const dialogConfig = new MatDialogConfig();
      dialogConfig.data={
        message : 'delete ' +data.name + ' product'
      };
      const dialogRef= this.dialog.open(ConfirmationComponent,dialogConfig);
      const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((response)=>{
        this.ngxService.start();
        this.deleteProduct(data.id);
        dialogRef.close();
      })


    }

    deleteProduct(id:any){
      this.productService.delete(id).subscribe((response:any)=>{
        this.ngxService.stop();
        this.tableData();
        this.responseMessage=response?.message;
        this.snackbarService.openSnackBar(this.responseMessage,"success");
        },(error:any)=>{
          this.ngxService.stop();
          if(error.error?.message)
          {
            this.responseMessage = error.error?.message;
          }
          else{
            this.responseMessage = GlobalConstants.genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
        });

    }
    
onChange(status:any,id:any){
  var data ={
    status:status.toString(),
    id:id
  }
  this.productService.updateStatus(data).subscribe((response:any)=>{
    this.ngxService.stop();
    this.responseMessage=response?.message;
    this.snackbarService.openSnackBar(this.responseMessage,"success");
    },(error:any)=>{
      this.ngxService.stop();
      if(error.error?.message)
      {
        this.responseMessage = error.error?.message;
      }
      else{
        this.responseMessage = GlobalConstants.genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.error);
    });

}
}
