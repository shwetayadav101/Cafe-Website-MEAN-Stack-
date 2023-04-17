import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  changePasswordForm:any=FormGroup;
  responseMessage:any;

  constructor(
    private router:Router,
    private snackbarService:SnackbarService,
    private userService: UserService,
    private dialogRef: MatDialogRef<ChangePasswordComponent>,
    private ngxService:NgxUiLoaderService
  ) { }

  ngOnInit(): void {
  }


  initForm(){
    this.changePasswordForm = new FormGroup({
      oldPassword:new FormControl(''),
      newPassword:new FormControl(''),
      confirmPassword:new FormControl('')
    })
  }

  validateSubmit(){
    if(this.changePasswordForm.controls('oldPassword').value != this.changePasswordForm.controls('confirmPassword').value){
      return true;
    }else{
      return false;
    }
  }

  handleChangePasswordSubmit(){
    this.ngxService.start();
      var formData = this.changePasswordForm.value;

      var data = {
        oldPassword :  formData.oldPassword,
        newPassword : formData.newPassword,
        confirmPassword :formData.confirmPassword
      }
      this.userService.changePassword(data).subscribe((response:any)=>{
        this.ngxService.stop();
        this.responseMessage = response?.message;
        this.dialogRef.close();
        this.snackbarService.openSnackBar(this.responseMessage,"")
      },(error)=>{
        console.log(error);
        this.ngxService.stop();
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
