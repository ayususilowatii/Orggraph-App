import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideNzI18n, id_ID } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { IconDefinition } from '@ant-design/icons-angular';
import {
  ApartmentOutline, TeamOutline, ProjectOutline, SettingOutline,
  PlusOutline, EditOutline, DeleteOutline, SearchOutline,
  DownloadOutline, UploadOutline, SaveOutline, ReloadOutline,
  WarningOutline, CloseOutline, LeftOutline, RightOutline,
  BankOutline, CloudSyncOutline, RollbackOutline,
  CheckCircleOutline, SolutionOutline, UserAddOutline, UserOutline,
  FolderOpenOutline, FolderOutline, TagOutline, IdcardOutline,
  MailOutline, PhoneOutline, EyeOutline,
  ExclamationCircleOutline, InfoCircleOutline, ClusterOutline,
  FileImageOutline, MenuFoldOutline, MenuUnfoldOutline,
  DatabaseOutline, ToolOutline, AppstoreOutline, NumberOutline,
  PictureOutline, CloudDownloadOutline, CloudUploadOutline,
  CheckOutline, MinusCircleOutline,
} from '@ant-design/icons-angular/icons';
import { routes } from './app.routes';

const icons: IconDefinition[] = [
  ApartmentOutline, TeamOutline, ProjectOutline, SettingOutline,
  PlusOutline, EditOutline, DeleteOutline, SearchOutline,
  DownloadOutline, UploadOutline, SaveOutline, ReloadOutline,
  WarningOutline, CloseOutline, LeftOutline, RightOutline,
  BankOutline, CloudSyncOutline, RollbackOutline,
  CheckCircleOutline, SolutionOutline, UserAddOutline, UserOutline,
  FolderOpenOutline, FolderOutline, TagOutline, IdcardOutline,
  MailOutline, PhoneOutline, EyeOutline,
  ExclamationCircleOutline, InfoCircleOutline, ClusterOutline,
  FileImageOutline, MenuFoldOutline, MenuUnfoldOutline,
  DatabaseOutline, ToolOutline, AppstoreOutline, NumberOutline,
  PictureOutline, CloudDownloadOutline, CloudUploadOutline,
  CheckOutline, MinusCircleOutline,
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(),
    provideNzI18n(id_ID),
    importProvidersFrom(NzIconModule.forRoot(icons)),
    importProvidersFrom(NzModalModule),
    importProvidersFrom(NzMessageModule),
  ]
};
