import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackbarService } from '../services/snackbar.service';
import { UserService } from '../services/user.service';
import { FormControl, FormGroup } from '@angular/forms';
import { GlobalConstants } from '../shared/global-constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm:any=FormGroup;
  responseMessage:any;

  constructor(
    private router:Router,
    private snackbarService:SnackbarService,
    private userService: UserService,
    private dialogRef: MatDialogRef<LoginComponent>,
    private ngxService:NgxUiLoaderService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(){
    this.loginForm = new FormGroup({
      email: new FormControl(''),
      password :  new FormControl('')
    })

  }
    handleSubmit(){
      this.ngxService.start();
      var formData = this.loginForm.value;

      var data = {
        email :  formData.email,
        password : formData.password
      }
      this.userService.login(data).subscribe((response:any)=>{
        this.ngxService.stop();
        this.responseMessage = response?.message;
        this.dialogRef.close();
        localStorage.setItem('token',response.token);
        this.router.navigate(['/cafe/dashboard']);
        this.snackbarService.openSnackBar(this.responseMessage," ")
      },(error)=>{
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

