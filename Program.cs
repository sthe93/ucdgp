using System.Security.Cryptography;
using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using ResearchSuite.Helpers;
using ResearchSuite.Models;
using ResearchSuite.Services;
using ResearchSuite.Services.CustomMiddleware;
using ResearchSuite.Services.Interfaces;
using ResearchSuite.Services.Ucdp;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/research_submissions.log", rollingInterval: RollingInterval.Day, retainedFileCountLimit: 30)
    .CreateLogger();

// Replace default logging
builder.Host.UseSerilog();

// Register IHttpClientFactory
builder.Services.AddHttpClient(); // <-- this line is important

// Add services
builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(new ResponseCacheAttribute
    {
        NoStore = true,
        Location = ResponseCacheLocation.None
    });
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddDistributedMemoryCache();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
    {
        options.Cookie.Name = "Cookie.AspNetCore.Cookies";
        options.LoginPath = "/Account/Login";
        options.LogoutPath = "/Account/Logout";
        options.AccessDeniedPath = "/Account/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        options.SlidingExpiration = true;
    });

builder.Services.AddSession(options =>
{
    options.Cookie.Name = ".ResearchSuite.Session";
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Lax;

});

builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));
builder.Services.AddMemoryCache();
builder.Services.AddScoped<ILoginService, LoginService>();
builder.Services.AddScoped<IResearchService, ResearchService>();
builder.Services.AddScoped<IEmailService, EmailService>();
//builder.Services.AddScoped<ITraceItService, TraceItService>();
builder.Services.AddScoped<IUcdpService, UcdpService>();
builder.Services.AddScoped<ILookupService, LookupService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IAdministrationService, AdministrationService>();
builder.Services.AddScoped<IMyApplicationsService, MyApplicationsService>();
builder.Services.AddScoped<IApplicationsService, ApplicationsService>();
builder.Services.AddScoped<IApplicationsDashboardService, ApplicationsDashboardService>();


builder.Services.AddAuthorization();

builder.Services.Configure<FormOptions>(o =>
{
    o.ValueLengthLimit = int.MaxValue;
    o.MultipartBodyLengthLimit = 150 * 1024 * 1024; // 150 MB
});

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 150 * 1024 * 1024; // 150 MB
});

builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN-HEADERNAME";
    options.SuppressXFrameOptionsHeader = false;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
});

builder.Services.AddHttpsRedirection(options =>
{
    options.RedirectStatusCode = StatusCodes.Status308PermanentRedirect;
    options.HttpsPort = 443;
});

builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
    options.Preload = true;
});


var app = builder.Build();

// Enable detailed error pages for development
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseHsts();
    app.UseExceptionHandler("/Home/Error");
}

HttpContextHolder.Accessor = app.Services.GetRequiredService<IHttpContextAccessor>();



var basePath = builder.Configuration["AppSettings:BasePath"];
if (!string.IsNullOrEmpty(basePath))
{
    app.UsePathBase(basePath);
}

app.UseHttpsRedirection();
app.UseHsts();

bool isProd = app.Environment.IsProduction();
bool isDev = !isProd;

app.Use(async (context, next) =>
{
    // Generate random nonces for this request
    var scriptNonceBytes = RandomNumberGenerator.GetBytes(16);
    var styleNonceBytes = RandomNumberGenerator.GetBytes(16);

    var scriptNonce = Convert.ToBase64String(scriptNonceBytes);
    var styleNonce = Convert.ToBase64String(styleNonceBytes);

    // Store nonces for Razor views
    context.Items["CSPNonce"] = scriptNonce;
    context.Items["CSPStyleNonce"] = styleNonce;

    // Build and apply the CSP
    var csp = ResearchSuite.Helpers.CSPBuilder.BuildCSP(scriptNonce, styleNonce, isDev);
    context.Response.Headers.Append("Content-Security-Policy", csp);

    await next();
});

app.Use(async (context, next) =>
{
    context.Items["BasePath"] = basePath ?? "";
    await next();
});


app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        if (ctx.File.Name.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
        {
            ctx.Context.Response.StatusCode = StatusCodes.Status403Forbidden;
            ctx.Context.Response.ContentLength = 0;
            ctx.Context.Response.Body = Stream.Null;
        }
    }
});

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseRouting();
app.UseSession();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");


app.Run();
