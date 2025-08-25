# Backend Configuration Fixes

Here are the changes needed in your ASP.NET Core backend to fix the issues:

## 1. Fix the Stripe Secret Key Configuration

In your StripeCheckoutController, change:

```csharp
StripeConfiguration.ApiKey = _configuration["SecretKey"];
```

To:

```csharp
StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
```

## 2. Add CORS Support

In your `Program.cs` or `Startup.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder
            .WithOrigins("http://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Make sure this is called before UseRouting and UseAuthorization
app.UseCors();
```

## 3. Configure appsettings.json

Make sure your `appsettings.json` has:

```json
{
  "Stripe": {
    "SecretKey": "sk_test_your_secret_key",
    "PublishableKey": "pk_test_your_public_key",
    "WebhookSecret": "whsec_your_webhook_secret"
  },
  "FRONTEND_URL": "http://localhost:4200",
  "JWT": {
    "Key": "your_secret_key_at_least_16_characters_long",
    "Issuer": "your_issuer",
    "Audience": "your_audience",
    "ExpireMinutes": 60
  }
}
```

## 4. Fix Authentication in StripeCheckoutController

1. Remove the `[Authorize]` attribute if you're not ready to implement authentication yet:

```csharp
// [Authorize]  // Comment this out temporarily
[HttpPost("create-checkout-session")]
public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutRequest request)
{
    // ...
}
```

## 5. Debugging the Request

Add better error logging in the controller:

```csharp
[HttpPost("create-checkout-session")]
public async Task<IActionResult> CreateCheckoutSession([FromBody] CreateCheckoutRequest request)
{
    try
    {
        // Log incoming request for debugging
        Console.WriteLine($"Received checkout request: {JsonSerializer.Serialize(request)}");
        
        if (request == null || request.LineItems == null || !request.LineItems.Any())
        {
            return BadRequest(new { error = "Invalid request data. LineItems cannot be empty." });
        }

        // Rest of your code...
    }
    catch (Exception ex)
    {
        // Detailed error logging
        Console.WriteLine($"Error in CreateCheckoutSession: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        return StatusCode(500, new { error = ex.Message });
    }
}
```

## 6. Verify the JWT Middleware Configuration

Make sure your authentication middleware is properly configured:

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JWT:Issuer"],
            ValidAudience = builder.Configuration["JWT:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"]))
        };
        
        // Enable detailed error messages for debugging
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"Authentication failed: {context.Exception}");
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Console.WriteLine($"OnChallenge: {context.AuthenticateFailure}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine($"Token validated for: {context.Principal.Identity.Name}");
                return Task.CompletedTask;
            }
        };
    });
```

Make sure to install the necessary NuGet packages:
- `Microsoft.AspNetCore.Authentication.JwtBearer`
- `System.IdentityModel.Tokens.Jwt`
