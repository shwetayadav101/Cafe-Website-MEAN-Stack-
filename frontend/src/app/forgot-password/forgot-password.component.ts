import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackbarService } from '../services/snackbar.service';
import { UserService } from '../services/user.service';
import { GlobalConstants } from '../shared/global-constants';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  constructor(
    private snackbarService:SnackbarService,
    private userService: UserService,
    private dialogRef: MatDialogRef<ForgotPasswordComponent>,
    private ngxService:NgxUiLoaderService
  ) { }

  forgotPasswordForm:any=FormGroup;
  responseMessage:any;

  ngOnInit(): void {
    this.initForm();
  }

  initForm(){
    this.forgotPasswordForm = new FormGroup({
      email:new FormControl('')  
    })

  }
    handleSubmit(){
      this.ngxService.start();
      var formData = this.forgotPasswordForm.value;

      var data = {
        email :  formData.email
      }
      this.userService.forgotPassword(data).subscribe((response:any)=>{
        this.ngxService.stop();
        this.responseMessage = response?.message;
        this.dialogRef.close();
        this.snackbarService.openSnackBar(this.responseMessage,"")
      },(error)=>{
        if(error.error?.message){
          this.responseMessage = error.error?.message;
        }
        else{
          this.responseMessage = GlobalConstants.genericError;
        }

        this.snackbarService.openSnackBar(this.responseMessage,GlobalConstants.genericError);
      })
    }
  }
  


