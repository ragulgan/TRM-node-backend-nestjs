import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './config/logger';
import { AuthModule } from './auth/auth.module';
import { FileUploadModule } from './fileUpload/fileUpload.module';
import { RoleModule } from './role/module'
import { WelcomeModule } from './welcome/welcome.module'
import { LangModule } from './lang/lang.module'
import { AdminModule } from './adminUsers/admin.module'
import { StateModule } from './state/state.module'
import { DistrictModule } from './district/district.module'
import { CityModule } from './city/city.module'
import { ContactUsModule } from './contactus/contactus.module';
import { SystemVariablesModule } from './systemVariables/systemVariables.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { GalleryModule } from './gallery/gallery.module';
import { NewsAndEventsModule } from './newsandevents/newsandevents.module';
import { CategoryModule } from './category/category.module';
import { SubCategoryModule } from './subCategory/subCategory.module';
import { MotivationModule } from './motivation/motivation.module';
import { PromotionModule } from './advertisement/promotion.module';
import { AboutUsModule } from './aboutUs/aboutUs.module';
import { PositionModule } from './position/postition.module';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
    imports: [
        ConfigModule.forRoot(), MongooseModule.forRoot(process.env.MONGODB_URL),
        MailerModule.forRoot({
            transport: {
                host: process.env.SMTP_HOST_NAME,
                auth: {
                    user: process.env.SMTP_USERNAME,
                    pass: process.env.SMTP_PASSWORD,
                },
            },
        }),
        ScheduleModule.forRoot(),
        ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'static'), }),
        AuthModule,
        UserModule,
        ProductModule,
        GalleryModule,
        NewsAndEventsModule,
        FileUploadModule,
        RoleModule,
        WelcomeModule,
        LangModule,
        AdminModule,
        DistrictModule,
        StateModule,
        CityModule,
        ContactUsModule,
        SystemVariablesModule,
        CategoryModule,
        SubCategoryModule,
        MotivationModule,
        PromotionModule,
        AboutUsModule,
        PositionModule,
        ManufacturerModule,
        DashboardModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*')
    }
}