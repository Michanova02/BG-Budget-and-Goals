FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["BG.API/BG.API.csproj", "BG.API/"]
COPY ["BG.Application/BG.Application.csproj", "BG.Application/"]
COPY ["BG.Domain/BG.Domain.csproj", "BG.Domain/"]
COPY ["BG.Infrastructure/BG.Infrastructure.csproj", "BG.Infrastructure/"]
RUN dotnet restore "BG.API/BG.API.csproj"

COPY . .
WORKDIR "/src/BG.API"
RUN dotnet publish "BG.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "BG.API.dll"]