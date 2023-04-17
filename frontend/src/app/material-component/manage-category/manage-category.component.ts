import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CategoryService } from 'src/app/services/category.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { CategoryComponent } from '../dialog/category/category.component';

@Component({
  selector: 'app-manage-category',
  templateUrl: './manage-category.component.html',
  styleUrls: ['./manage-category.component.scss']
})
export class ManageCategoryComponent implements OnInit {
  displayedColumns:string[]=['name' , 'edit'];
  responseMessage:any;
  dataSource:any;

  constructor(
    private snackbarService:SnackbarService,
    private dialog: MatDialog,
    private ngxService:NgxUiLoaderService,
    private categoryService : CategoryService,
    private router : Router
  ) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.tableData();
  }

  tableData(){
    this.categoryService.getCategories().subscribe((response:any)=>{
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
    const dialogRef = this.dialog.open(CategoryComponent,dialogConfig);
    this.router.events.subscribe(()=>{
      dialogRef.close();
    });
    const sub  = dialogRef.componentInstance.onAddCategory.subscribe(
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
    const dialogRef = this.dialog.open(CategoryComponent,dialogConfig);
    this.router.events.subscribe(()=>{
      dialogRef.close();
    });
    const sub  = dialogRef.componentInstance.onEditCategory.subscribe(
      (response)=>{
        this.tableData();
      }
    )

    

  }

}
